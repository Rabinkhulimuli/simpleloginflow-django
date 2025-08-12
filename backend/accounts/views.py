import io
import base64
import pyotp
import qrcode
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken 
from .serializers import RegisterSerializer  # <-- add this import

User = get_user_model()


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"detail":"registered"}, status=201)
    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"detail":"invalid credentials"}, status=401)
 
    if user.mfa_enabled:
        return Response({"mfa_required": True, "user_id": user.id,"setup_required": False})
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return Response({
        "user_id":user.id,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
       "mfa_required": False,
       "setup_required": True,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mfa_setup(request):
    user = request.user

    if not user.mfa_secret:
        secret = pyotp.random_base32()
        user.mfa_secret = secret
        user.save()
    else:
        secret = user.mfa_secret
   
    issuer = "YourAppName"
    otp_uri = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name=issuer)
  
    qr = qrcode.make(otp_uri)
    buffered = io.BytesIO()
    qr.save(buffered, format="PNG")
    img_b64 = base64.b64encode(buffered.getvalue()).decode()
    data_uri = f"data:image/png;base64,{img_b64}"
    return Response({"otp_uri": otp_uri, "qr_code": data_uri})
@api_view(['POST'])
@permission_classes([AllowAny]) 
def mfa_verify(request):
    user_id = request.data.get('user_id')
    code = request.data.get('otp')
    
   
    if request.user.is_authenticated:
        user = request.user
    elif user_id:
        user = get_object_or_404(User, pk=user_id)
    else:
        return Response({"detail": "Authentication required"}, status=401)
    
    if not user.mfa_secret:
        return Response({"detail": "MFA not initialized"}, status=400)
        
    totp = pyotp.TOTP(user.mfa_secret)
    if totp.verify(code, valid_window=1):
        if not request.user.is_authenticated:
            user.mfa_enabled = True
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "verified": True,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user_id": user.id
            })
        return Response({"verified": True})
    
    return Response({"verified": False}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({"detail": "Successfully logged out"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
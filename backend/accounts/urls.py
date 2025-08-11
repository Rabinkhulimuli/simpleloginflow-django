from django.urls import path
from .views import register_view, login_view, mfa_setup, mfa_verify,logout_view

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('mfa/setup/', mfa_setup, name='mfa_setup'),
    path('mfa/verify/', mfa_verify, name='mfa_verify'),
    path('/logout',logout_view,name='logout')
]

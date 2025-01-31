# pdfprocessor/urls.py
from django.urls import path
from .views import home, chat_with_pdf, signup_view, login_view
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('', home, name='home'),
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('chat/<int:pdf_id>/', chat_with_pdf, name='chat'),
]
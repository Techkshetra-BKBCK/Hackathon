from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.home, name='home'),
    path('generateimage/', views.generateimage, name='generateimage'),
    path('insight/', views.insight, name='insight'),
    path('generatetext/', views.generatetext,name="generatetext"),
    path('send-to-chatbot/',views.send_to_chatbot, name='send_to_chatbot'),
    path('about/', views.about, name='about'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
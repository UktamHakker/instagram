from django.urls import path
from .views import *


urlpatterns = [
    path('main/', main, name='main'),
    path('post/', post, name="post"),
    path('profile/', profile, name='profile'),
    path('story/', story, name='story'),
    path('home/', main, name='homea'),
    path('nast/', nast, name='nast'),
    path('story/', story, name='story')
]

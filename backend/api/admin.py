from django.contrib import admin
from .models import *

admin.site.register(Genre)
admin.site.register(Anime)
admin.site.register(UserAnimeList)
admin.site.register(Review)
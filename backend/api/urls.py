from django.urls import path
from .views import (
    genre_list,
    review_list_create,
    user_anime_list,
    AnimeListCreateAPIView,
    AnimeDetailAPIView
)

urlpatterns = [
    path('genres/', genre_list),
    path('reviews/', review_list_create),
    path('my-list/', user_anime_list),
    path('anime/', AnimeListCreateAPIView.as_view()),
    path('anime/<int:pk>/', AnimeDetailAPIView.as_view()),
]
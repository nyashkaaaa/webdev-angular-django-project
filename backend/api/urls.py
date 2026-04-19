from django.urls import path
from . import views
from .views import (
    genre_list,
    review_list_create,
    user_anime_list_detail,
    add_review,
    AnimeListCreateAPIView,
    AnimeDetailAPIView
)

urlpatterns = [
    path('genres/', genre_list),
    path('reviews/', review_list_create),
    path('user-anime-list/', views.user_anime_list_list),  # ← добавим эту функцию
    path('user-anime-list/<int:pk>/', user_anime_list_detail),
    path('anime/', AnimeListCreateAPIView.as_view()),
    path('anime/<int:pk>/', AnimeDetailAPIView.as_view()),
    path('anime/<int:pk>/reviews/', add_review),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
]
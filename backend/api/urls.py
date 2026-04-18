from django.urls import path
from .views import (
    genre_list,
    review_list_create,
    user_anime_list,
    AnimeListCreateAPIView,
    AnimeDetailAPIView,
    register_view,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', register_view),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('genres/', genre_list),
    path('reviews/', review_list_create),
    path('my-list/', user_anime_list),
    path('anime/', AnimeListCreateAPIView.as_view()),
    path('anime/<int:pk>/', AnimeDetailAPIView.as_view()),
    path('register/', register_view),

]
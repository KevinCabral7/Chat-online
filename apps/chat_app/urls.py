from django.urls import path

from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("chat/create-room", views.create_room, name="create_room"),
    path("chat/<pk>", views.RoomDetailView.as_view(), name="room_view"),
    path("chat/<pk>/send", views.send_message, name="send_message"),
    path("chat/<pk>/invite", views.invite_user, name="invite_user"),

]
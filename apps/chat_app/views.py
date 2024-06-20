import json
from django.http import HttpResponse
from django.shortcuts import redirect, render
from chat import settings
from .models import Message, Room
from django.views.generic.detail import DetailView
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, User

def home(request):
    if not request.user.is_authenticated:
        return redirect(settings.LOGOUT_REDIRECT_URL)
    User = get_user_model()
    users = User.objects.all()
    user_groups = []
    for g in request.user.groups.all():
        user_groups.append(g.id)
    rooms = Room.objects.filter(group__in=user_groups)  
    return render(request, 'chat/home.html', {
        'rooms': rooms,
        'users': users
        })

class RoomDetailView(DetailView):
    model = Room
    template_name = 'chat/list-messages.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return context
    
def send_message(request, pk):
    data = json.loads(request.body)
    room = Room.objects.get(id=pk)
    new_message = Message.objects.create(user = request.user, text = data['message'])
    room.messages.add(new_message)
    return render(request, 'chat/message.html', {
        'm': new_message
    })

def create_room(request):
    data = json.loads(request.body)
    group = Group.objects.create(name = data['title'])
    group.user_set.add(request.user)
    room = Room.objects.create(user=request.user, title=data['title'], group=group)
    return render(request, 'chat/room.html', {
        'r': room
    })

def invite_user(request, pk):
    data = json.loads(request.body)
    room = Room.objects.get(id=pk)
    user_id = int(data['users'])
    user = User.objects.get(id=user_id)
    group = room.group
    group.user_set.add(user)
    return HttpResponse('a')
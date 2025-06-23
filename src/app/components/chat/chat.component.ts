import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatService } from '../../services/chat/chat.service';
import { Subscription, interval } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeWhile } from 'rxjs/operators';

interface User {
    _id: string;
    name: string;
    userImage?: string;
    isOnline?: boolean;
}

interface Message {
    _id: string;
    text: string;
    senderId: string;
    receiverId: string;
    createdAt: Date;
    status?: 'sent' | 'delivered' | 'read';
    isTemp?: boolean;
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.css'],
    providers: [DatePipe]
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
    @ViewChild('messageContainer') private messageContainer!: ElementRef;

    users: User[] = [];
    chattedUsers: User[] = [];
    messages: Message[] = [];
    selectedUser: User | null = null;
    newMessage = '';
    currentUserId: string = '';
    isLoading = true;
    private subscriptions = new Subscription();
    private pollingInterval = 5000; // Poll every 5 seconds
    private pollingSubscription?: Subscription;

    constructor(
        private chatService: ChatService,
        private route: ActivatedRoute,
        private authService: AuthService
    ) {
        const currentUser = this.authService.currentUser.value;
        this.currentUserId = currentUser?._id || '';
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['userId']) {
                this.selectUserById(params['userId']);
            }
        });
        this.loadUsers();
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        try {
            if (this.messageContainer) {
                this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
            }
        } catch (err) {
            console.error('Error scrolling to bottom:', err);
        }
    }

    private loadUsers() {
        this.isLoading = true;
        this.subscriptions.add(
            this.chatService.getChattedUsers().subscribe({
                next: (response: any) => {
                    this.chattedUsers = response.data || [];
                    this.loadAllUsers();
                },
                error: (err) => {
                    console.error('Failed to load chatted users:', err);
                    this.loadAllUsers(); // Proceed even if this fails
                }
            })
        );
    }

    private loadAllUsers() {
        this.subscriptions.add(
            this.chatService.getUsers().subscribe({
                next: (response: any) => {
                    this.users = response.data || [];
                    this.mergeUserLists();
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Failed to load users:', err);
                    this.isLoading = false;
                }
            })
        );
    }

    private mergeUserLists() {
        const chattedIds = new Set(this.chattedUsers.map(u => u._id));
        this.users = [
            ...this.chattedUsers,
            ...this.users.filter(user => !chattedIds.has(user._id))
        ];
    }

    selectUser(user: User) {
        if (!user) {
            console.error('Cannot select undefined user');
            return;
        }
        this.selectedUser = user;
        this.chatService.selectUser(user);
        this.loadMessages();
        this.startPolling();
    }

    private startPolling() {
        this.stopPolling();
        if (!this.selectedUser) return;

        this.pollingSubscription = interval(this.pollingInterval)
            .pipe(takeWhile(() => !!this.selectedUser))
            .subscribe(() => this.loadMessages());
    }

    private stopPolling() {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }

    selectUserById(userId: string) {
        const user = this.users.find(u => u._id === userId);
        if (user) {
            this.selectUser(user);
        } else {
            console.warn(`User with id ${userId} not found. Waiting for user list to load.`);
            this.subscriptions.add(
                this.chatService.getUsers().subscribe({
                    next: (response: any) => {
                        this.users = response.data || [];
                        this.mergeUserLists();
                        const retryUser = this.users.find(u => u._id === userId);
                        if (retryUser) this.selectUser(retryUser);
                    }
                })
            );
        }
    }

    private loadMessages() {
        if (!this.selectedUser) {
            console.warn('No selected user to load messages for');
            return;
        }
        this.subscriptions.add(
            this.chatService.getMessages(this.selectedUser._id).subscribe({
                next: (response: any) => {
                    this.messages = response.data || [];
                },
                error: (err) => {
                    console.error('Failed to load messages:', err);
                }
            })
        );
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.selectedUser) return;

        const tempMessage: Message = {
            _id: Date.now().toString(),
            text: this.newMessage,
            senderId: this.currentUserId,
            receiverId: this.selectedUser._id,
            createdAt: new Date(),
            isTemp: true
        };

        this.messages.push(tempMessage);
        this.newMessage = '';
        this.scrollToBottom();

        this.subscriptions.add(
            this.chatService.sendMessage(this.selectedUser._id, tempMessage.text).subscribe({
                next: (response: any) => {
                    const index = this.messages.findIndex(m => m._id === tempMessage._id);
                    if (index !== -1) {
                        this.messages[index] = response.data || tempMessage; // Fallback to temp if no data
                    }
                },
                error: (err) => {
                    console.error('Failed to send message:', err);
                    this.messages = this.messages.filter(m => m._id !== tempMessage._id);
                }
            })
        );
    }

    getUserAvatar(user: User | undefined): string {
        return user?.userImage || 'images/images ui/ProfileImg.png';
    }

    isMyMessage(message: Message): boolean {
        return message?.senderId === this.currentUserId;
    }

    ngOnDestroy() {
        this.stopPolling();
        this.subscriptions.unsubscribe();
    }
}
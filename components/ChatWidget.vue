<template>
  <div class="md:flex h-full overflow-y-auto bg-background">
    <button @click="sidebarOpen = true" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md md:hidden m-4">Open Chat</button>
    <!-- Conversations list -->
    <div :class="['w-72 duration-300 xl:w-80 border-r flex flex-col max-md:absolute max-md:top-0 max-md:border-t max-md:left-0 max-md:h-full max-md:z-10 max-md:bg-background', sidebarOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full']">
      <div class="p-4 border-b flex items-center justify-between">
        <div class="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
          <input class="flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-8 rounded-full" placeholder="Search contacts..." type="search" v-model="searchQuery">
        </div>
        <div class="ml-2">
          <button class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:text-accent-foreground size-10 rounded-full h-9 w-9 hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-settings h-4 w-4" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
      </div>
      <div class="flex flex-col h-full">
        <div class="p-2 border-b">
          <div class="h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full grid grid-cols-3">
            <button @click="activeTab = 'all'" :class="['inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-full', activeTab === 'all' ? 'bg-background text-foreground shadow-sm' : '']">All</button>
            <button @click="activeTab = 'online'" :class="['inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-full', activeTab === 'online' ? 'bg-background text-foreground shadow-sm' : '']">Online</button>
            <button @click="activeTab = 'unread'" :class="['inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-full', activeTab === 'unread' ? 'bg-background text-foreground shadow-sm' : '']">Unread</button>
          </div>
      </div>

      <!-- Unified Create Chat Modal -->
      <div v-if="showCreate" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" @keydown.esc="closeCreate">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
          <button @click="showCreate = false" class="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <h3 class="font-medium text-lg text-gray-900 mb-4">Start New Chat</h3>
          <div class="mb-4 flex gap-2">
            <button @click="createType = 'dm'" :class="['flex-1 py-2 rounded-lg font-medium', createType === 'dm' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700']">Direct Message</button>
            <button @click="createType = 'group'" :class="['flex-1 py-2 rounded-lg font-medium', createType === 'group' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700']">Group Chat</button>
          </div>
          <form v-if="createType === 'dm'" @submit.prevent="startDMByEmail" class="space-y-3">
            <input ref="dmInput" v-model="dmEmail" placeholder="Enter user email or 'support'" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            <div class="flex gap-2">
              <button type="submit" :disabled="creating" class="flex-1 inline-flex items-center justify-center gap-2 w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium">
                <svg v-if="creating" class="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path></svg>
                Start DM
              </button>
              <button type="button" class="px-3 py-2 rounded-lg bg-gray-100 text-gray-700" @click="dmEmail = ''">Clear</button>
            </div>
          </form>
          <form v-else @submit.prevent="createGroup" class="space-y-3">
            <input v-model="newGroupName" placeholder="Group name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
            <div class="relative">
              <input v-model="userSearch" @input="onUserSearch" placeholder="Search users to add..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm" />
              <ul v-if="searchResults.length" class="absolute left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-auto z-20 shadow-lg">
                <li v-for="u in searchResults" :key="u.id" @click="addUserToInvite(u)" class="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0">
                  <div class="font-medium">{{ u.name }}</div>
                  <div class="text-xs text-gray-500">{{ u.email }}</div>
                </li>
              </ul>
            </div>
            <div v-if="selectedUsers.length > 0" class="flex flex-wrap gap-2">
              <div v-for="s in selectedUsers" :key="s.id" class="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                <span>{{ s.name || s.email }}</span>
                <button type="button" @click="removeSelectedUser(s)" class="ml-1 text-indigo-600 hover:text-indigo-800">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="text-xs text-gray-500">Up to 10 members (including you)</div>
            <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 font-medium">Create Group</button>
          </form>
        </div>
      </div>

        <div class="flex items-center justify-between p-3 border-b">
          <h3 class="font-medium text-sm">Conversations</h3>
          <div class="flex space-x-1">
            <button @click="showCreate = true" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:text-accent-foreground size-10 h-8 w-8 rounded-full hover:bg-muted" aria-label="New conversation">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-4 w-4" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            </button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div>
            <div v-for="t in allConversations" :key="t.id" @click="selectConversation(t)" :class="['flex items-center p-3 cursor-pointer transition-colors hover:bg-muted/50', t.id === activeConversation?.id ? 'bg-accent text-accent-foreground' : '']">
              <div class="relative flex-shrink-0">
                <img alt="User" class="rounded-full object-cover border border-border w-12 h-12" :src="t.avatar || `https://i.pravatar.cc/48?u=${t.id}`">
                <span v-if="t.status" class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background" :class="statusColor(t.status)"></span>
              </div>
              <div class="ml-3 flex-1 overflow-hidden">
                <div class="flex justify-between items-center">
                  <h4 class="truncate font-semibold" :class="{'font-semibold': t.unread > 0, 'font-medium': !t.unread}">{{ t.name }}</h4>
                  <span class="text-xs text-muted-foreground">{{ t.last_at ? formatTime(t.last_at) : '' }}</span>
                </div>
                <div class="flex justify-between items-center mt-0.5">
                  <p class="text-sm truncate max-w-[160px]" :class="t.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'">{{ t.last_preview || 'No messages yet' }}</p>
                  <div v-if="t.unread > 0" class="inline-flex items-center border py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-indigo-500 hover:bg-indigo-600 text-white ml-2 rounded-full px-1.5 min-w-[20px] h-5">{{ t.unread }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Messages pane -->
    <div class="flex-1 flex flex-col" :class="activeConversation ? 'flex' : 'hidden md:flex'">
      <div class="flex flex-col h-full">
      <header class="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="activeConversation = null" class="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div class="relative">
              <img :alt="activeConversationName" class="rounded-full object-cover w-10 h-10" :src="activeConversation?.avatar || `https://i.pravatar.cc/40?u=${activeConversation?.id}`">
              <span v-if="activeConversation?.status" class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background" :class="statusColor(activeConversation.status)"></span>
            </div>
            <div>
              <h3 class="font-medium">{{ activeConversationName }}</h3>
              <p class="text-xs text-muted-foreground">{{ activeConversation?.status || 'Offline' }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-1">
            <button class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone h-5 w-5"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path></svg></button>
            <button class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video h-5 w-5"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"></path><rect x="2" y="6" width="14" height="12" rx="2"></rect></svg></button>
            <button class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-5 w-5"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg></button>
            <button><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical h-5 w-5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></button>
        </div>
      </header>

      <div class="relative overflow-hidden flex-1 p-4 bg-gradient-to-b from-muted/30 to-background" ref="messagesPane">
        <div v-if="!activeConversation" class="flex flex-col items-center justify-center h-full text-center">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p class="text-gray-500 max-w-sm">Choose a chat from the sidebar or start a new conversation to begin messaging.</p>
        </div>

        <template v-else>
          <div class="space-y-6">
            <div v-for="(chunk, idx) in groupedMessages" :key="idx" class="space-y-4">
              <div class="flex justify-center">
                <span class="text-xs bg-muted/80 px-3 py-1 rounded-full text-muted-foreground font-medium shadow-sm">{{ chunk.timeLabel }}</span>
              </div>
              <div v-for="m in chunk.messages" :key="m.id" class="flex items-end gap-2 group" :class="m.sender_id === userId ? 'flex-row-reverse' : 'flex-row'">
                <div v-if="m.sender_id !== userId" class="flex-shrink-0">
                    <div class="relative w-7 h-7">
                        <img :alt="m.sender?.name || 'User'" class="rounded-full object-cover mb-1 border border-border" :src="m.sender?.avatar || `https://i.pravatar.cc/28?u=${m.sender_id}`">
                    </div>
                </div>
                <div class="max-w-[75%]">
                  <div :class="['rounded-2xl px-4 py-2.5 shadow-sm', m.sender_id === userId ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none']">
                    <p class="whitespace-pre-wrap break-words text-sm">{{ m.content }}</p>
                  </div>
                  <div class="flex items-center gap-1 mt-1 text-[10px]" :class="m.sender_id === userId ? 'justify-end pr-1 text-primary-foreground/70' : 'justify-start pl-1 text-muted-foreground'">
                    <span>{{ formatTime(m.created_at) }}</span>
                    <svg v-if="m.sender_id === userId" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check h-3.5 w-3.5 text-primary"><path d="M18 6 7 17l-5-5"></path><path d="m22 10-7.5 7.5L13 16"></path></svg>
                    <div v-if="m.sending" class="text-xs opacity-80">Sending…</div>
                    <div v-if="m.failed" class="text-xs text-red-600 flex items-center gap-2">
                      <span>Failed</span>
                      <button @click="resendMessage(m)" class="text-xs px-2 py-1 bg-gray-100 rounded">Retry</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing indicator placeholder -->
          <div v-if="isTyping" class="flex justify-start">
            <div class="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div class="flex items-center space-x-1">
                <div class="flex space-x-1">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                </div>
                <span class="text-xs text-gray-500 ml-2">Someone is typing...</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <footer class="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form @submit.prevent="sendMessage" class="flex items-end gap-2">
          <div class="flex space-x-1">
            <button type="button" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paperclip h-5 w-5"><path d="M13.234 20.252 21 12.3"></path><path d="m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486"></path></svg>
            </button>
            <button type="button" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image h-5 w-5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
            </button>
            <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />
          </div>
          <div class="relative flex items-center gap-2 flex-1">
            <textarea
              v-model="body"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift="onShiftEnter"
              placeholder="Type a message..."
              class="flex h-10 w-full border border-input bg-background py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none rounded-2xl transition-all px-5 !py-4"
              rows="1"
              ref="messageInput"
            ></textarea>
            <button type="submit" :disabled="!body.trim()" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-indigo-500 hover:bg-indigo-600 size-9 rounded-full transition-colors text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send h-4 w-4 text-white"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
            </button>
          </div>
          <div class="flex space-x-1">
            <button type="button" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-smile h-5 w-5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg></button>
            <button type="button" class="inline-flex items-center duration-300 justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground size-10 rounded-full h-9 w-9"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic h-5 w-5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg></button>
          </div>
        </form>
      </footer>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useAppAlert } from '~/composables/useAppAlert'
import useApi from '~/composables/useApi'

const threads = ref([])
const groups = ref([])
const messages = ref([])
const selectedThreadId = ref(null)
const selectedGroupId = ref(null)
const body = ref('')
const newGroupName = ref('')
const newGroupEmails = ref('')
const userSearch = ref('')
const searchResults = ref([])
const selectedUsers = ref([]) // array of user objects
const showCreate = ref(false)
const sidebarOpen = ref(true)
const creating = ref(false)
const createType = ref('dm')
const dmEmail = ref('')
const activeTab = ref('unread')
const searchQuery = ref('')
const alert = useAppAlert()
const auth = useAuthStore()
const userId = computed(() => auth.user?.id)
const apiBase = useRuntimeConfig().public.apiBase
const api = useApi()
const messageInput = ref(null)
const dmInput = ref(null)

const activeConversation = computed(() => {
  if (selectedGroupId.value) return { type: 'group', id: selectedGroupId.value }
  if (selectedThreadId.value) return { type: 'direct', id: selectedThreadId.value }
  return null
})

const activeConversationName = computed(() => {
  if (selectedGroupId.value) {
    const g = groups.value.find(x => x.id === selectedGroupId.value)
    return g ? g.name : 'Group'
  }
  if (selectedThreadId.value) {
    const t = threads.value.find(x => String(x.other_user_id || x.otherId || x.id) === String(selectedThreadId.value))
    return t ? (t.other_name || t.otherName || ('User ' + (t.otherId || t.other_user_id))) : 'Direct'
  }
  return 'No conversation'
})

const activeConversationSubtitle = computed(() => {
  if (selectedGroupId.value) return 'Group chat'
  if (selectedThreadId.value) return 'Direct message'
  return ''
})

const activeTitleInitial = computed(() => (activeConversationName.value || 'M').slice(0,1))

const allConversations = computed(() => {
  const convs = threads.value.map(c => ({
    id: String(c.other_user_id || c.otherId || c.id),
    type: 'direct',
    name: c.other_name || c.otherName || c.name,
    last_preview: c.last_message || c.last_preview,
    last_at: c.last_at || c.updated_at,
    unread: c.unread_count || 0,
    status: c.status || 'offline', // You need to add status to your user data
    avatar: c.avatar_url,
  }))
  const grps = groups.value.map(g => ({
    id: String(g.id),
    type: 'group',
    name: g.name,
    last_preview: g.last_message,
    last_at: g.updated_at,
    unread: g.unread_count || 0,
    status: null, // Groups don't have a single status
    avatar: g.avatar_url,
  }))
  let all = [...convs, ...grps].sort((a,b) => new Date(b.last_at || 0) - new Date(a.last_at || 0));
  if (activeTab.value === 'unread') all = all.filter(x => (x.unread || 0) > 0);
  if (searchQuery.value) all = all.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
  return all;
})

const isOnline = computed(() => {
  // Placeholder - would need real-time status from backend
  return Math.random() > 0.5
})

const isTyping = computed(() => {
  // Placeholder - would need real-time typing indicators from backend
  return false
})

function statusColor(status) {
    switch (status) {
        case 'online': return 'bg-green-500';
        case 'away': return 'bg-yellow-500';
        default: return 'bg-gray-400';
    }
}

function upsertThreadFromMessage(msg) {
  // Expect server message to use new fields: sender_id, recipient_id, content
  if (msg.group_id) return
  const otherId = msg.sender_id === userId.value ? msg.recipient_id : msg.sender_id
  if (!otherId) return
  let idx = threads.value.findIndex(c => String(c.other_user_id || c.otherId || c.id) === String(otherId))
  if (idx === -1) {
  threads.value.unshift({ other_user_id: otherId, other_name: msg.sender_name || null, last_message: msg.content, last_at: msg.created_at, unread_count: msg.sender_id === userId.value ? 0 : 1 })
  } else {
    const existing = threads.value[idx]
    existing.last_message = msg.content
    existing.last_at = msg.created_at
    if (msg.sender_id !== userId.value) existing.unread_count = (existing.unread_count || 0) + 1
    threads.value.splice(idx,1)
    threads.value.unshift(existing)
  }
}

function markThreadRead(otherId) {
  // server-side persist read state
  try {
    api.postJson('/api/chat/threads/mark-read', { other_user_id: otherId }).catch(()=>{})
  } catch (e) {}
  const idx = threads.value.findIndex(c => String(c.other_user_id || c.otherId || c.id) === String(otherId))
  if (idx !== -1) threads.value[idx].unread_count = 0
}

function groupedByTime(list) {
  // naive grouping by date (day)
  const out = []
  list.forEach(m => {
    const date = new Date(m.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const day = date.toDateString() === today.toDateString() ? 'Today' : date.toDateString() === yesterday.toDateString() ? 'Yesterday' : date.toLocaleDateString();

    let grp = out.find(g => g.timeLabel === day)
    if (!grp) { grp = { timeLabel: day, messages: [] }; out.push(grp) }
    grp.messages.push(m)
  })
  return out
}

const groupedMessages = computed(() => groupedByTime(messages.value))

function formatTime(dateString) {
  const date = new Date(dateString)
  if (isNaN(date)) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function selectConversation(conv) {
  if (conv.type === 'group') {
    selectGroup(conv);
  } else {
    selectThread(conv);
  }
}

function toggleEmoji() {
  // Placeholder - would implement emoji picker
  console.log('Toggle emoji picker')
}

function autoResizeTextarea() {
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
  }
}

async function loadThreads() {
  try {
    const res = await fetch(apiBase + '/api/chat/threads', { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      // server returns { conversations: [...], groups: [...] }
      threads.value = json.conversations || json.messages || []
      groups.value = json.groups || []
    }
  } catch (e) {
    // ignore
  }
}

function selectThread(t) {
  selectedGroupId.value = null;
  selectedThreadId.value = t.id || t.otherId || t.other_user_id;
  // load messages for this direct conversation
  fetch(apiBase + `/api/chat/messages?user_id=${selectedThreadId.value}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => {
    if (json && json.messages) messages.value = json.messages
    else messages.value = []
    // persist read state
    markThreadRead(selectedThreadId.value)
  }).catch(() => {
    messages.value = []
    markThreadRead(selectedThreadId.value)
  })
  if (window.innerWidth < 768) sidebarOpen.value = false;
  nextTick(() => scrollToBottom())
}

function selectGroup(g) {
  selectedThreadId.value = null;
  selectedGroupId.value = g.id;
  // load messages for the group from server
  fetch(apiBase + `/api/chat/messages?group_id=${g.id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => {
    messages.value = json && json.messages ? json.messages : []
  }).catch(() => { messages.value = [] })
  .finally(() => {
    // mark group read on server once opened
    try { api.postJson('/api/chat/groups/mark-read', { group_id: g.id }).catch(()=>{}) } catch (e) {}
    nextTick(() => scrollToBottom())
    if (window.innerWidth < 768) sidebarOpen.value = false;
  })
}

async function startDMByEmail() {
  const email = dmEmail.value.trim()
  if (!email) { 
    alert.push({ message: 'Enter an email', type: 'error', icon: 'heroicons:exclamation-circle' }); 
    return 
  }

  // Special case for support chat
  if (email.toLowerCase() === 'support' || email.toLowerCase() === 'help') {
    try {
      // Find first available admin for support chat
      const res = await fetch(apiBase + '/api/messages/support-chat', { credentials: 'include' })
      if (!res.ok) {
        alert.push({ message: 'Support chat unavailable', type: 'error', icon: 'heroicons:exclamation-circle' })
        return
      }
      const json = await res.json()
      const admin = json.contact

      // Create or get support thread
      const threadRes = await api.postJson('/api/chat/threads', { recipient_id: admin.id, type: 'support' })
      if (api.handleAuthStatus(threadRes)) return

      dmEmail.value = ''
      await loadThreads()
      selectedThreadId.value = admin.id

      // Load support messages
      const msgs = await fetch(apiBase + `/api/chat/messages?user_id=${admin.id}&type=support`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
      if (msgs && msgs.messages) messages.value = msgs.messages
      markThreadRead(admin.id)
      nextTick(() => scrollToBottom())

    } catch (e) {
      alert.push({ message: 'Could not start support chat', type: 'error', icon: 'heroicons:x-circle' })
    }
    return
  }

  // Regular DM flow
  try {
  const r = await fetch(apiBase + '/api/users/find-by-email?email=' + encodeURIComponent(email), { credentials: 'include' })
    if (r.status === 404) { 
      alert.push({ message: 'User not found', type: 'error', icon: 'heroicons:exclamation-circle' }); 
      return 
    }
    if (!r.ok) { 
      alert.push({ message: 'Lookup failed', type: 'error', icon: 'heroicons:exclamation-circle' }); 
      return 
    }
    const j = await r.json()
    const user = j.user
    
    // ensure thread on server
    const threadRes = await api.postJson('/api/chat/threads', { recipient_id: user.id, type: 'direct' })
    if (api.handleAuthStatus(threadRes)) return
    if (!threadRes.ok) {
      alert.push({ message: 'Could not create thread', type: 'error', icon: 'heroicons:exclamation-circle' })
      return
    }
    
    dmEmail.value = ''
    await loadThreads()
    selectedThreadId.value = user.id
    
    const msgs = await fetch(apiBase + `/api/chat/messages?user_id=${user.id}&type=direct`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
    if (msgs && msgs.messages) messages.value = msgs.messages
    markThreadRead(user.id)
    nextTick(() => scrollToBottom())
    
  } catch (e) {
    alert.push({ message: 'Network error', type: 'error', icon: 'heroicons:x-circle' })
  }
}

const messagesPane = ref(null)
function scrollToBottom() {
  try {
    const el = messagesPane.value
    if (el && el.scrollHeight) el.scrollTop = el.scrollHeight
  } catch (e) {}
}

async function sendMessage() {
  if (!body.value.trim()) return
  // optimistic UI: push a temp message immediately
  const tempId = 'temp-' + Date.now()
  const optimistic = {
    id: tempId,
    sender_id: userId.value,
    recipient_id: selectedThreadId.value || null,
    group_id: selectedGroupId.value || null,
    content: body.value,
    created_at: new Date().toISOString(),
    sending: true,
  }
  messages.value.push(optimistic)
  const payload = { body: body.value }
  if (selectedGroupId.value) payload.group_id = selectedGroupId.value
  else if (selectedThreadId.value) payload.recipient_id = selectedThreadId.value

  body.value = ''
  nextTick(() => scrollToBottom())

  try {
  const res = await api.postJson('/api/chat/send', payload)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const json = await res.json()
      // replace optimistic message with server message
      const idx = messages.value.findIndex(m => m.id === tempId)
  if (idx !== -1) messages.value.splice(idx, 1, json.message)
      nextTick(() => scrollToBottom())
    } else {
      // mark optimistic as failed
      const idx = messages.value.findIndex(m => m.id === tempId)
  if (idx !== -1) messages.value[idx].sending = false, messages.value[idx].failed = true
  alert.push({ message: 'Failed to send message', type: 'error', icon: 'heroicons:x-circle' })
    }
  } catch (e) {
    const idx = messages.value.findIndex(m => m.id === tempId)
    if (idx !== -1) messages.value[idx].sending = false, messages.value[idx].failed = true
  alert.push({ message: 'Network error', type: 'error', icon: 'heroicons:x-circle' })
  }
}

async function createGroup() {
  const emails = selectedUsers.value.map(u => u.email).concat(newGroupEmails.value.split(',').map(s => s.trim()).filter(Boolean))
  try {
    const res = await api.postJson('/api/chat/groups', { name: newGroupName.value, emails })
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const json = await res.json()
  groups.value.unshift(json.group)
      newGroupName.value = ''
      newGroupEmails.value = ''
      selectedUsers.value = []
  showCreate.value = false
  alert.push({ message: 'Group created', type: 'success', icon: 'heroicons:check-circle' })
    } else {
      const err = await res.json().catch(() => null)
  alert.push({ message: err?.errors ? 'Invalid group data' : 'Failed to create group', type: 'error', icon: 'heroicons:exclamation-circle' })
    }
  } catch (e) {
  alert.push({ message: 'Network error', type: 'error', icon: 'heroicons:x-circle' })
  }
}

let _userSearchTimer = null
async function onUserSearch() {
  const q = userSearch.value.trim()
  if (_userSearchTimer) clearTimeout(_userSearchTimer)
  if (!q) { searchResults.value = []; return }
  _userSearchTimer = setTimeout(async () => {
    try {
      const res = await fetch(apiBase + '/api/users/search?q=' + encodeURIComponent(q), { credentials: 'include' })
      if (res.ok) {
        const json = await res.json()
        searchResults.value = (json.users || []).filter(u => !selectedUsers.value.some(s => s.id === u.id))
      }
    } catch (e) {}
  }, 250)
}

function addUserToInvite(u) {
  if (selectedUsers.value.length >= 9) {
    alert.push({ message: 'Maximum 10 members allowed', type: 'error', icon: 'heroicons:exclamation-triangle' })
    return
  }
  selectedUsers.value.push(u)
  userSearch.value = ''
  searchResults.value = []
}

function removeSelectedUser(u) { selectedUsers.value = selectedUsers.value.filter(s => s.id !== u.id) }

function onShiftEnter() { body.value += '\n' }

function onFileChange(e) { /* TODO: implement file upload */ alert.push({message: "File uploads not implemented yet."}) }

function formatDate(s) { try { return new Date(s).toLocaleString() } catch (e) { return s } }

// Real-time listening via Echo
let _channel = null
function attachEcho() {
  if (!process.client || !window?.Echo || !userId.value) return
  try {
    // subscribe to the server channel name: App.Models.User.{id}
    window.Echo.private(`App.Models.User.${userId.value}`).listen('.MessageSent', (payload) => {
      const msg = payload.message ?? payload
      upsertThreadFromMessage(msg)
      const otherId = msg.sender_id === userId.value ? msg.recipient_id : msg.sender_id
      if (selectedThreadId.value && String(selectedThreadId.value) === String(otherId)) {
        messages.value.push(msg)
        // mark as read since it's visible
        markThreadRead(otherId)
      }
      nextTick(() => scrollToBottom())
    })
  } catch (e) { console.error('attachEcho error', e) }
}

function attachGroupChannel(groupId) {
  if (!process.client || !window?.Echo || !groupId) return
  try {
    if (_channel && _channel.leave) _channel.leave()
    _channel = window.Echo.private(`App.Models.Group.${groupId}`)
    _channel.listen('.MessageSent', (payload) => {
      const msg = payload.message ?? payload
      if (msg.group_id == groupId) {
        const gi = groups.value.find(g => g.id == groupId)
        if (gi) { gi.last_message = msg.content; gi.last_at = msg.created_at; gi.unread_count = (gi.unread_count||0) + (msg.sender_id === userId.value ? 0 : 1) }
        if (selectedGroupId.value && String(selectedGroupId.value) === String(groupId)) {
          messages.value.push(msg)
          // TODO: call mark-group-read API if desired
        }
      }
      nextTick(() => scrollToBottom())
    })
  } catch (e) { console.error('attachGroupChannel error', e) }
}

// Scroll-up pagination: when user scrolls near top, fetch older messages
let _loadingOlder = false
async function maybeLoadOlder() {
  try {
    const el = messagesPane.value
    if (!el || _loadingOlder) return
    if (el.scrollTop > 50) return // only load when very near top
    // find earliest message id we have
    if (!messages.value.length) return
    _loadingOlder = true
    const earliest = messages.value[0]
    const params = new URLSearchParams()
    params.set('per_page', '50')
    params.set('before_id', String(earliest.id))
    if (selectedThreadId.value) params.set('user_id', String(selectedThreadId.value))
    if (selectedGroupId.value) params.set('group_id', String(selectedGroupId.value))
    const url = apiBase + '/api/chat/messages?' + params.toString()
    const res = await fetch(url, { credentials: 'include' })
    if (res.ok) {
      const json = await res.json()
      if (json && json.messages && json.messages.length) {
        // prepend older messages while keeping scroll position
        const oldHeight = el.scrollHeight
        messages.value = json.messages.concat(messages.value)
        await nextTick()
        // try to maintain scroll position
        el.scrollTop = el.scrollHeight - oldHeight
      }
    }
  } catch (e) {
    console.error('load older messages failed', e)
  } finally { _loadingOlder = false }
}


onMounted(() => {
  if (!process.client) return
  loadThreads()
  attachEcho()
  // If the page was opened with ?user_id or ?group_id, open that conversation immediately
  try {
    const route = useRoute()
    const q = route && route.query ? route.query : {}
    if (q.user_id) {
      // route.query values may be strings or arrays
      const uid = Array.isArray(q.user_id) ? q.user_id[0] : q.user_id
      selectedThreadId.value = uid
      // load messages for this direct conversation
      fetch(apiBase + `/api/chat/messages?user_id=${uid}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => {
        if (json && json.messages) messages.value = json.messages
        else messages.value = []
        markThreadRead(uid)
      }).catch(() => { messages.value = []; markThreadRead(uid) })
      nextTick(() => scrollToBottom())
    } else if (q.group_id) {
      const gid = Array.isArray(q.group_id) ? q.group_id[0] : q.group_id
      selectedGroupId.value = gid
      fetch(apiBase + `/api/chat/messages?group_id=${gid}`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(json => { messages.value = json && json.messages ? json.messages : [] }).catch(() => { messages.value = [] })
      nextTick(() => scrollToBottom())
    }
  } catch (e) {}
  // wire scroll-up pagination
  try {
    const el = messagesPane.value
    if (el) {
      el.addEventListener('scroll', () => {
        maybeLoadOlder()
      })
    }
  } catch (e) {}

  // Auto-resize textarea
  nextTick(() => {
    const textarea = messageInput.value
    if (textarea) {
      textarea.addEventListener('input', autoResizeTextarea)
      autoResizeTextarea()
    }
  })

  // Global key handling: ESC to close modal or sidebar on small screens
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (showCreate.value) closeCreate();
      else if (window.innerWidth < 1024 && sidebarOpen.value) sidebarOpen.value = false
    }
  })
})

watch(() => selectedGroupId.value, (id) => {
  if (id) attachGroupChannel(id)
  else if (_channel && _channel.leave) { try { _channel.leave() } catch (e) {} }
})

function closeCreate() {
  showCreate.value = false
}

async function resendMessage(m) {
  if (!m || !m.body) return
  // mark as resending
  m.failed = false
  m.sending = true
  try {
  const payload = { content: m.content ?? m.body }
  if (m.group_id) payload.group_id = m.group_id
  else if (m.recipient_id) payload.recipient_id = m.recipient_id
    const res = await api.postJson('/api/chat/send', payload)
    if (api.handleAuthStatus(res)) return
    if (res.ok) {
      const json = await res.json()
      // replace message in messages array
      const idx = messages.value.findIndex(x => x.id === m.id)
      if (idx !== -1) messages.value.splice(idx, 1, json.message)
    } else {
      m.sending = false
      m.failed = true
    }
  } catch (e) {
    m.sending = false
    m.failed = true
  }
}

// autofocus dm input when modal opens
watch(() => showCreate.value, (v) => {
  if (v) {
    nextTick(() => {
      if (dmInput.value && dmInput.value.focus) dmInput.value.focus()
    })
  }
})
</script>

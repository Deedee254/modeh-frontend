<template>
  <div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h2 class="text-lg font-medium mb-6">Quiz Details</h2>
      
      <!-- Basic Info Section -->
      <div class="space-y-6 mb-8">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            v-model="modelValue.title"
            type="text"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            :class="{ 'border-red-300': errors._title }"
          />
          <p v-if="errors._title" class="mt-1 text-sm text-red-600">{{ errors._title }}</p>
        </div>

        <!-- Grade & Subject Selection -->
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
            <select 
              v-model="selectedGrade"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select Grade</option>
              <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                {{ grade.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select 
              v-model="selectedSubject"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              :disabled="!selectedGrade"
            >
              <option value="">Select Subject</option>
              <option v-for="subject in subjectsByGrade" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Topic Selection -->
        <div class="flex items-end gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Topic</label>
            <select 
              v-model="modelValue.topic_id"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              :class="{ 'border-red-300': errors._topic }"
              :disabled="!selectedSubject"
            >
              <option value="">Select Topic</option>
              <option v-for="topic in filteredTopics" :key="topic.id" :value="topic.id">
                {{ topic.name }}
              </option>
            </select>
            <p v-if="errors._topic" class="mt-1 text-sm text-red-600">{{ errors._topic }}</p>
          </div>
          
          <UButton 
            size="sm"
            color="white"
            @click="emit('createTopic')"
            :disabled="!selectedSubject"
          >New Topic</UButton>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            v-model="modelValue.description"
            rows="3"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Optional: Add a brief description of this quiz"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-6 flex justify-end space-x-4">
      <UButton
        color="white"
        @click="saveAndContinue"
        :loading="saving"
      >Save and Continue</UButton>
      
      <UButton
        color="primary"
        @click="validate"
      >Continue to Settings</UButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  grades: {
    type: Array,
    default: () => []
  },
  subjects: {
    type: Array,
    default: () => []
  },
  topics: {
    type: Array,
    default: () => []
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'createTopic', 'save', 'next'])

const selectedGrade = ref('')
const selectedSubject = ref('')

// Computed properties
const subjectsByGrade = computed(() => {
  if (!selectedGrade.value || !Array.isArray(props.subjects)) return []
  return props.subjects.filter(s => 
    s && typeof s === 'object' && s.grade_id === selectedGrade.value
  )
})

const filteredTopics = computed(() => {
  if (!selectedSubject.value || !Array.isArray(props.topics)) return []
  return props.topics.filter(t => 
    t && typeof t === 'object' && t.subject_id === selectedSubject.value
  )
})

// Watchers
watch(selectedGrade, () => {
  selectedSubject.value = ''
  emit('update:modelValue', { ...props.modelValue, topic_id: '' })
})

watch(selectedSubject, () => {
  emit('update:modelValue', { ...props.modelValue, topic_id: '' })
})

// Methods
function validate() {
  if (!props.modelValue.title?.trim()) {
    return false
  }
  if (!props.modelValue.topic_id) {
    return false
  }
  emit('next')
  return true
}

async function saveAndContinue() {
  if (validate()) {
    await emit('save')
    emit('next')
  }
}
</script>
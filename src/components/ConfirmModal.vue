<script setup>
import {onBeforeUnmount, watch} from 'vue'

const props = defineProps({
  open: {type: Boolean, default: false},
  title: {type: String, default: 'Confirmation'},
  message: {type: String, default: 'Êtes-vous sûr ?'},
  confirmLabel: {type: String, default: 'Confirmer'},
  cancelLabel: {type: String, default: 'Annuler'},
})

const emit = defineEmits(['confirm', 'cancel'])

function onKeydown(e) {
  if (e.key === 'Escape') emit('cancel')
}

watch(
    () => props.open,
    (isOpen) => {
      if (isOpen) {
        window.addEventListener('keydown', onKeydown)
        document.body.style.overflow = 'hidden'
      } else {
        window.removeEventListener('keydown', onKeydown)
        document.body.style.overflow = ''
      }
    },
    {immediate: true}
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="emit('cancel')">
        <div
            class="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-message"
        >
          <h2 id="modal-title" class="title">{{ title }}</h2>
          <p id="modal-message" class="message">{{ message }}</p>

          <div class="actions">
            <button class="btn cancel" @click="emit('cancel')">{{ cancelLabel }}</button>
            <button class="btn confirm" @click="emit('confirm')">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.55);
}

.modal {
  width: 100%;
  max-width: 420px;
  padding: 28px;
  border-top: 4px solid var(--gold);
  border-radius: 8px;
  background: var(--cream);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.title {
  margin: 0 0 12px;
  color: var(--bordeaux);
  font-family: var(--display);
  font-size: 1.4rem;
}

.message {
  margin: 0 0 24px;
  color: var(--bordeaux);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid var(--bordeaux);
  border-radius: 4px;
  font-family: var(--display);
  font-size: 0.85rem;
  cursor: pointer;
}

.cancel {
  background: none;
  color: var(--bordeaux);
}

.confirm {
  background: var(--bordeaux);
  color: var(--gold);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.2s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: translateY(-16px) scale(0.97);
}
</style>
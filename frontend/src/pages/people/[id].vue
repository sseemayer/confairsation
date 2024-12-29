<template lang="pug">
v-container(v-if="editingPerson && avatar"): v-form(@submit.prevent.stop="onSubmit")
  v-row
    v-col(sm="12")
      v-text-field(
        v-model="editingPerson.name"
        label="Name"
        autofocus
        variant="solo-filled"
      )
        template(#append)
          MiniColorPicker(
            v-model="editingPerson.avatar.skinColor"
            :swatches="skinColors"
          )

  v-row
    v-col.avatar-stack(
      cols="12"
      sm="1"
    )
      Avatar.mb-2(
        :id="null"
        :options="avatar"
        :size="128"
      )

      MiniColorPicker(v-model="avatar.backgroundColor")


    v-col(
      cols="12"
      sm="11"
    )

      v-select(
        v-model="accessories"
        label="Accessories"
        :items="avatarChoices.accessories"
      )
        template(#append)
          MiniColorPicker(v-model="avatar.accessoriesColor")

      v-select(
        v-model="clothing"
        label="Clothing"
        :items="avatarChoices.clothing"
      )
        template(#append)
          MiniColorPicker(v-model="avatar.clothesColor")

      v-select(
        v-model="eyebrows"
        label="Eyebrows"
        :items="avatarChoices.eyebrows"
      )

      v-select(
        v-model="eyes"
        label="Eyes"
        :items="avatarChoices.eyes"
      )

      v-select(
        v-model="facialHair"
        label="Facial Hair"
        :items="avatarChoices.facialHair"
      )
        template(#append)
          MiniColorPicker(v-model="avatar.facialHairColor")

      v-select(
        v-model="mouth"
        label="Mouth"
        :items="avatarChoices.mouth"
      )

      v-select(
        v-model="top"
        label="Top (Hair or Hat)"
        :items="avatarChoices.top"
      )
        template(#append)
          MiniColorPicker(v-model="topColor")

  v-row
    v-col.text-right(sm="12")
      v-btn-group
        v-btn(
          color="primary"
          type="submit"
        ) Save
        v-btn(@click="onDelete") Delete
        v-btn(:to="{name: '/'}") Back

</template>

<script setup lang="ts">
import {usePersonsStore, type Person} from '@/stores/persons'
import {avatarChoices, skinColors} from '@/avatar'

const route = useRoute('/people/[id]')
const router = useRouter()

const personsStore = usePersonsStore()

const editingPerson = ref<Person | undefined>(undefined)

function updatePerson() {
  if (!personsStore.persons || !route.params.id || !(route.params.id in personsStore.persons)) {
    editingPerson.value = undefined
  } else {
    editingPerson.value = JSON.parse(JSON.stringify(personsStore.persons[route.params.id]))
  }
}
updatePerson()

watch(route, updatePerson)
watch(personsStore, updatePerson)

const avatar = computed(() => editingPerson.value?.avatar)

const accessories = computed({
  get() {
    return (avatar.value?.accessories || ['none'])[0]
  },
  set(v) {
    if (avatar.value) {avatar.value.accessories = v === 'none' ? [] : [v]}
  }
})

const clothing = computed({
  get() {
    return (avatar.value?.clothing || ['none'])[0]
  },
  set(v) {
    if (avatar.value) {avatar.value.clothing = v === 'none' ? [] : [v]}
  }
})

const eyebrows = computed({
  get() {
    return (avatar.value?.eyebrows || ['none'])[0]
  },
  set(v) {
    if (avatar.value) {avatar.value.eyebrows = v === 'none' ? [] : [v]}
  }
})

const eyes = computed({
  get() {
    return (avatar.value?.eyes || ['none'])[0]
  },
  set(v) {
    if (avatar.value) {avatar.value.eyes = v === 'none' ? [] : [v]}
  }
})

const facialHair = computed({
  get() {
    return (avatar.value?.facialHair || ['none'])[0]
  },
  set(v) {
    if (avatar.value) {avatar.value.facialHair = v === 'none' ? [] : [v]}
  }
})

const mouth = computed({
  get() {
    return (avatar.value?.mouth || ['none'])[0]
  },
  set(v) {
    if (avatar.value) {avatar.value.mouth = v === 'none' ? [] : [v]}
  }
})

const top = computed({
  get() {
    return (avatar.value?.top || ['none'])[0]
  },
  set(v) {
    if (avatar.value) {avatar.value.top = v === 'none' ? [] : [v]}
  }
})

const topColor = computed({
  get() {
    return avatar.value?.hairColor
  },
  set(v) {
    if (!avatar.value) {return }
    avatar.value.hairColor = v
    avatar.value.hatColor = v
  }
})

async function onSubmit() {
  if (!editingPerson.value) {return }
  await personsStore.update(editingPerson.value)
  router.push({name: '/'})
}

async function onDelete() {
  if (!editingPerson.value) {return }
  if (confirm("Really DELETE?\nIf this person was part of a conversation, they will be shown there as (unknown)")) {
    await personsStore.remove(editingPerson.value)
    router.push({name: '/'})
  }

}

</script>

<style lang="stylus" scoped>
.avatar-stack
  width 100%
  display flex
  flex-direction column

  justify-content flex-start
  align-items center

</style>

export interface ModalConfigButton {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'cancel'
}
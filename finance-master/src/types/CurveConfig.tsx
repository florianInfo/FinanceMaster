export type AggregationMode = 'total' | 'min' | 'max'
export type GraphView = 'day' | 'month' | 'year'
export interface CurveConfig {
  id: string // 'solde' | 'revenu' | 'balance' | categoryId
  label: string
  color: string
  visible: boolean
  aggregation: AggregationMode
  editable?: boolean // pour savoir si on peut changer/supprimer
}
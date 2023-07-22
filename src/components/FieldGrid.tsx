import styles from './shared.module.scss'

export default function FieldGrid({ children }) {
  return <section className={styles['field-grid']}>
    {children}
  </section>
}

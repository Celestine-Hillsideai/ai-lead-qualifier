import styles from "./layout.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.brand}>AI Lead Qualifier</div>
      {children}
    </div>
  );
}

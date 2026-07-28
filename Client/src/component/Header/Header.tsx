import { BsChatText } from "react-icons/bs";
import styles from './header.module.css'

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export default function Header({ username, onLogout }: HeaderProps) {
  return (
    <div className={styles.header}>
      <span className={styles.logo}>
        <BsChatText /> ChatApp
      </span>
      <div className={styles.headerRight}>
        <span className={styles.username}>{username}</span>
        <button onClick={onLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
}

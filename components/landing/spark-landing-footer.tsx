import Link from "next/link"

export function SparkLandingFooter() {
  return (
    <footer className="spark-landing__footer">
      <div className="spark-landing__container spark-landing__footer-inner">
        <nav className="spark-landing__footer-nav" aria-label="Дополнительно">
          <Link href="#" className="spark-landing__footer-link">
            Поддержка
          </Link>
          <span className="spark-landing__footer-sep" aria-hidden>
            ·
          </span>
          <Link href="#" className="spark-landing__footer-link">
            Политика конфиденциальности
          </Link>
        </nav>
        <p className="spark-landing__footer-text">
          Создано с верой в то, что каждая искра достойна шанса © 2025
        </p>
      </div>
    </footer>
  )
}

import '../styles/footer.css'
const Footer = () => {
    return(
        <footer className="footer">
        <p className="footer-title">
        <span className="brand-highlight">Consta</span>Tinopla
        </p>
        <p className="footer-text">
            © {new Date().getFullYear()} ConstaTinopla. Todos los derechos reservados.
        </p>
    </footer>
    )
}
export default Footer
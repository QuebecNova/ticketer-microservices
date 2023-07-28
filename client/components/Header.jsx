import Link from "next/link";
export function Header({ user }) {
  
  const links = [
    !user && {
      label: "Sign Up",
      href: "/auth/signup",
    },
    !user && { label: "Sign In", href: "/auth/signin" },
    user && { label: 'My Orders', href: "/orders"},
    user && {label: 'Sell Ticket', href: '/tickets/create'},
    user && { label: "Sign Out", href: "/auth/signout" }
  ].filter((link) => link).map((link) => (
    <li key={link.href} className="nav-item">
      <Link className="nav-link" href={link.href}>
        {link.label}
      </Link>{" "}
    </li>
  ));


  return (
    <nav className="navbar navbar-light bg-light">
      <Link className="navbar-brand" href="/">
        GitTix
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {links}
        </ul>
      </div>
    </nav>
  );
}

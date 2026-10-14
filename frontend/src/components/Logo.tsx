export function LogoIcon({ size = 28 }: { size?: number }) {
  return <img src="/logo-icon.png" alt="" style={{ height: size, width: 'auto' }} className="logo-icon-img" />
}

export function LogoMark({ iconSize = 26 }: { iconSize?: number }) {
  return (
    <span className="logo-mark">
      <LogoIcon size={iconSize} />
      <span className="logo-wordmark">Wallet</span>
    </span>
  )
}

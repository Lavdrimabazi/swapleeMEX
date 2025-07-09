"use client"

import QRCode from 'react-qr-code'

interface QRCodeProps {
  data: string
  size?: number
  className?: string
}

export function QRCodeComponent({ data, size = 128, className = "" }: QRCodeProps) {
  return (
    <QRCode 
      value={data} 
      size={size} 
      className={className}
      level="M"
      fgColor="#000000"
      bgColor="#FFFFFF"
    />
  )
}

export default QRCodeComponent 
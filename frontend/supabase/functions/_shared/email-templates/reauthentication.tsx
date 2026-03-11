/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>رمز التحقق الخاص بك</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>🕌 تأكد</Text>
        <Heading style={h1}>تأكيد الهوية</Heading>
        <Text style={text}>استخدم الرمز أدناه لتأكيد هويتك:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          صلاحية هذا الرمز محدودة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Cairo', Arial, sans-serif" }
const container = { padding: '30px 25px', textAlign: 'right' as const }
const brand = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#257a4d',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#2c2621',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#8c8073',
  lineHeight: '1.8',
  margin: '0 0 25px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#257a4d',
  margin: '0 0 30px',
  textAlign: 'center' as const,
  letterSpacing: '6px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }

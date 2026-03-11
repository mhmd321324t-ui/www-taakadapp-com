/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>رابط تسجيل الدخول إلى تأكد</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>🕌 تأكد</Text>
        <Heading style={h1}>رابط تسجيل الدخول</Heading>
        <Text style={text}>
          اضغط على الزر أدناه لتسجيل الدخول إلى تأكد. صلاحية هذا الرابط محدودة.
        </Text>
        <Button style={button} href={confirmationUrl}>
          تسجيل الدخول
        </Button>
        <Text style={footer}>
          إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
const button = {
  backgroundColor: '#257a4d',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '16px',
  padding: '12px 24px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }

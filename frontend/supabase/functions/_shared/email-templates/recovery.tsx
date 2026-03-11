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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>إعادة تعيين كلمة المرور في تأكد</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>🕌 تأكد</Text>
        <Heading style={h1}>إعادة تعيين كلمة المرور</Heading>
        <Text style={text}>
          وصلنا طلب لإعادة تعيين كلمة المرور الخاصة بحسابك في تأكد.
          اضغط على الزر أدناه لاختيار كلمة مرور جديدة.
        </Text>
        <Button style={button} href={confirmationUrl}>
          تعيين كلمة مرور جديدة
        </Button>
        <Text style={footer}>
          إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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

/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="ar" dir="rtl">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>تمت دعوتك للانضمام إلى تأكد</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>🕌 تأكد</Text>
        <Heading style={h1}>تمت دعوتك</Heading>
        <Text style={text}>
          تمت دعوتك للانضمام إلى{' '}
          <Link href={siteUrl} style={link}>
            <strong>تأكد</strong>
          </Link>
          . اضغط على الزر أدناه لقبول الدعوة وإنشاء حسابك.
        </Text>
        <Button style={button} href={confirmationUrl}>
          قبول الدعوة
        </Button>
        <Text style={footer}>
          إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهل هذه الرسالة.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
const link = { color: '#257a4d', textDecoration: 'underline' }
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

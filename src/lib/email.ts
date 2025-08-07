import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

export interface EmailReminderData {
  to: string
  artistName: string
  deadline: {
    title: string
    dueDate: Date
    description?: string
    type: string
    daysUntil: number
  }
}

export async function setupEmailTransporter() {
  // Configure your email provider here
  // For development, you can use Gmail with app passwords
  // For production, use services like SendGrid, Mailgun, etc.
  
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email configuration missing. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.')
    return null
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })
}

export async function sendDeadlineReminder(data: EmailReminderData): Promise<boolean> {
  try {
    const transporter = await setupEmailTransporter()
    
    if (!transporter) {
      console.error('Email transporter not configured')
      return false
    }

    const { deadline } = data
    const urgencyLevel = deadline.daysUntil <= 1 ? 'urgent' : deadline.daysUntil <= 3 ? 'important' : 'reminder'
    
    const subject = `${urgencyLevel === 'urgent' ? '🚨 URGENT' : urgencyLevel === 'important' ? '⚠️ IMPORTANT' : '📅'} Deadline Reminder: ${deadline.title}`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Deadline Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
          .deadline-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .urgent { border-left: 4px solid #ef4444; }
          .important { border-left: 4px solid #f59e0b; }
          .reminder { border-left: 4px solid #10b981; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>StudioMate Deadline Reminder</h1>
            <p>Hello ${data.artistName},</p>
          </div>
          
          <div class="content">
            <div class="deadline-info ${urgencyLevel}">
              <h2>${deadline.title}</h2>
              <p><strong>Due Date:</strong> ${deadline.dueDate.toLocaleDateString()}</p>
              <p><strong>Days Remaining:</strong> ${deadline.daysUntil}</p>
              <p><strong>Type:</strong> ${deadline.type}</p>
              ${deadline.description ? `<p><strong>Description:</strong> ${deadline.description}</p>` : ''}
            </div>
            
            <p>
              ${urgencyLevel === 'urgent' 
                ? 'This deadline is due very soon! Please take action immediately.' 
                : urgencyLevel === 'important' 
                ? 'This deadline is approaching. Please review and take action soon.' 
                : 'This is a friendly reminder about your upcoming deadline.'}
            </p>
            
            <p>
              <a href="${process.env.NEXTAUTH_URL}/dashboard" 
                 style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
                View in StudioMate
              </a>
            </p>
          </div>
          
          <div class="footer">
            <p>You're receiving this because you have email notifications enabled in StudioMate.</p>
            <p>To change your notification preferences, visit your dashboard.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `
      StudioMate Deadline Reminder
      
      Hello ${data.artistName},
      
      ${deadline.title}
      Due Date: ${deadline.dueDate.toLocaleDateString()}
      Days Remaining: ${deadline.daysUntil}
      Type: ${deadline.type}
      ${deadline.description ? `Description: ${deadline.description}` : ''}
      
      ${urgencyLevel === 'urgent' 
        ? 'This deadline is due very soon! Please take action immediately.' 
        : urgencyLevel === 'important' 
        ? 'This deadline is approaching. Please review and take action soon.' 
        : 'This is a friendly reminder about your upcoming deadline.'}
      
      Visit StudioMate: ${process.env.NEXTAUTH_URL}/dashboard
      
      You're receiving this because you have email notifications enabled in StudioMate.
      To change your notification preferences, visit your dashboard.
    `

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: data.to,
      subject,
      text: textContent,
      html: htmlContent
    })

    return true
  } catch (error) {
    console.error('Email sending error:', error)
    return false
  }
}

export async function processDeadlineReminders(): Promise<void> {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Get all artists with email notifications enabled
    const artists = await prisma.artist.findMany({
      include: {
        user: true,
        notificationPreference: true,
        deadlines: {
          where: {
            isCompleted: false,
            dueDate: {
              gte: today
            }
          }
        }
      },
      where: {
        notificationPreference: {
          emailEnabled: true
        }
      }
    })

    for (const artist of artists) {
      if (!artist.notificationPreference || !artist.user.email) continue

      const reminderIntervals = JSON.parse(artist.notificationPreference.reminderIntervals) as number[]
      
      for (const deadline of artist.deadlines) {
        const daysUntil = Math.ceil((deadline.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        
        // Check if we should send a reminder for this deadline
        if (reminderIntervals.includes(daysUntil)) {
          const shouldSendReminder = 
            (deadline.type === 'opportunity' && artist.notificationPreference.opportunityDeadlines) ||
            (deadline.type === 'custom' && artist.notificationPreference.customDeadlines) ||
            (deadline.type === 'application' && artist.notificationPreference.applicationDeadlines)

          if (shouldSendReminder) {
            await sendDeadlineReminder({
              to: artist.user.email,
              artistName: artist.user.name || 'Artist',
              deadline: {
                title: deadline.title,
                dueDate: deadline.dueDate,
                description: deadline.description || undefined,
                type: deadline.type,
                daysUntil
              }
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('Deadline reminder processing error:', error)
  }
}

export async function testEmailConfiguration(): Promise<boolean> {
  try {
    const transporter = await setupEmailTransporter()
    
    if (!transporter) {
      return false
    }

    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email configuration test failed:', error)
    return false
  }
}
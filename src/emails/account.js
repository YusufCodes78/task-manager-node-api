import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


  export const sendWelcomeEmail = (email, name) => {
    sgMail
  .send({
    to: email,
    from: 'rashidyusuf5253@gmail.com',
    subject: 'Welcome to Task Manager',
    text: `Thanks for joining in ${name}!`,
    html: '<strong>Thanks for joining in!</strong>',
  })
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
  }
  export const sendCancelationEmail = (email, name) => {
    sgMail
  .send({
    to: email,
    from: 'rashidyusuf5253@gmail.com',
    subject: 'Sorry to see you go',
    text: `We are sorry to see you go ${name}. We hope to see you back sometime soon!`,
    html: '<strong>Hope to see you back!</strong>',
  })
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
  }
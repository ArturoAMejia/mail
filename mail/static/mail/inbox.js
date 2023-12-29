document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector("form").onsubmit = async (e) => {
    e.preventDefault()
    const recipients = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;

    const res = await fetch('/emails', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipients,
        subject,
        body
      })
    })
    const result = await res.json()

    if (result.error) {
      alert(result.error)
    } else {
      alert(result.message)
      load_mailbox('sent')
    }
  }

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

/**
 * 
 * @param {string} mail 
 * @param {string} mailbox 
 */
const create_mail_box = (mail, mailbox, open) => {

  const container = document.createElement('div')
  const sender = document.createElement("h4");
  const timestamp = document.createElement("h4");
  const recipients = document.createElement("h4");
  const subject = document.createElement("h5");
  const content = document.createElement("p");

  sender.innerText = `${mailbox === 'inbox' ? `Sender` : `To`}: ${mail.sender}`
  subject.innerText = `Subject: ${mail.subject}`;
  timestamp.innerText = `Timestamp: ${mail.subject}`;
  recipients.innerText = `Recipients: ${mail.subject}`;
  content.innerText = mail.body;

  container.classList.add('my-4', "p-4", "rounded-md", 'bg-white', 'text-black', 'h-24', 'truncate')

  if (mail.read === true) {
    container.classList.add('bg-gray-700', 'text-white')
    container.classList.remove('bg-white', 'text-black')
  }

  if (open === true) {
    container.classList.add('h-full');
    container.classList.remove('truncate');

    container.append(sender, recipients, subject, timestamp, content);
  } else {
    container.append(sender, subject, content)
  }

  return container
}

/**
 * 
 * @param {string} mail 
 * @param {string} mailbox 
 */
const view_email = (mail, mailbox) => {
  console.log({ mail, mailbox })


  fetch(`/emails/${mail.id}`, {
    method: 'PUT',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({

      ...mail,
      read: true

    })
  })
  const emails_view = document.querySelector('#emails-view');

  const view = create_mail_box(mail, mailbox, true);

  emails_view.innerHTML = ``
  emails_view.append(view)
}


async function load_mailbox(mailbox) {

  const req = await fetch(`/emails/${mailbox}`)
  const mails = await req.json();

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view');
  emails_view.innerHTML = `<h3 class="py-2 font-bold text-2xl">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const mail_container = document.createElement("section");

  mails.forEach(element => {
    const view = create_mail_box(element, mailbox, false)

    view.onclick = () => view_email(element, mailbox)

    mail_container.append(view)
  })

  emails_view.append(mail_container)
}


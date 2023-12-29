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
    document.querySelector('#compose-recipients').value = ''
    document.querySelector('#compose-subject').value = ''
    document.querySelector('#compose-body').value = ''
  }

});

/**
 * 
 * @param {boolean} replay 
 */
function compose_email(replay = false, mail = {}) {

  const email = document.querySelector("#user_mail").value;
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  let new_recipients = []

  if (replay === true) {
    const recipients_filter = mail.recipients.filter((rec) => rec !== email);
    new_recipients = [...recipients_filter, mail.sender]
  }


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = `${replay === true ? new_recipients.toString() : ''}`;
  document.querySelector('#compose-subject').value = `${(replay === true && !mail.subject.includes('Re: ')) ? `Re: ${mail.subject}` : mail.subject}`;
  document.querySelector('#compose-body').value = `${replay === true ? `On ${mail.timestamp} ${mail.sender} wrote: ` : ''}`
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
  timestamp.innerText = `Timestamp: ${mail.timestamp}`;
  recipients.innerText = `Recipients: ${mail.recipients.toString()}`;
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
  if (mailbox === 'inbox' || mailbox === 'archive') {
    const container = document.createElement('div');
    const reply_button = document.createElement('button');
    const archive_button = document.createElement('button');

    container.classList.add('flex', 'justify-end', 'gap-2');

    reply_button.innerHTML = 'Reply';
    reply_button.classList.add('p-3', 'rounded-md', 'bg-blue-900', 'mt-4',);

    archive_button.innerHTML = `${mailbox === 'archive' ? 'Unarchive' : 'Archive'}`;
    archive_button.classList.add('p-3', 'rounded-md', 'bg-red-900', 'mt-4',);

    reply_button.onclick = () => compose_email(true, mail)


    archive_button.onclick = () => {
      fetch(`/emails/${mail.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({

          ...mail,
          archived: mail.archived === true ? false : true

        })
      })
      alert("Mail archived")
      load_mailbox('inbox')
    }

    container.append(reply_button, archive_button);
    emails_view.append(container);
  }
  emails_view.append(view)
}

async function load_mailbox(mailbox) {

  const req = await fetch(`/emails/${mailbox}`)
  const mails = await req.json()

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


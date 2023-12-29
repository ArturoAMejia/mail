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

async function load_mailbox(mailbox) {

  const req = await fetch(`/emails/${mailbox}`)
  const res = await req.json();

  const mails = res;


  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const emails_view = document.querySelector('#emails-view');
  emails_view.innerHTML = `<h3 class="py-2 font-bold text-2xl">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  const mail_container = document.createElement("section");

  mail_container.classList.add()
  mails.forEach(element => {

    const container = document.createElement('div')
    const sender = document.createElement("h4");
    const subject = document.createElement("h5");
    const content = document.createElement("p");

    sender.innerText = `${mailbox === 'inbox' ? `Sender` : `To`}: ${element.sender}`
    subject.innerText = `Subject: ${element.subject}`
    content.innerText = element.body

    content.classList.add("text-break");
    container.classList.add("my-4", `${element.read === true ? 'bg-gray-700' : 'bg-white'}`, "p-4", "rounded-md", `${element.read === true ? 'text-white' : "text-black"}`);

    container.append(sender, subject, content)
    mail_container.append(container)
  })

  emails_view.append(mail_container)
}


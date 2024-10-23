const overlay = document.getElementById('overlay');
const spinner = document.getElementById('spinner');
const sendingText = document.getElementById('sendingText');

const socket = new WebSocket('ws://localhost:3000'); // Create a WebSocket connection

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const { sentCount, totalRecipients } = data;
    sendingText.innerText = `Sending... ${sentCount} out of ${totalRecipients} emails sent.`;
};

document.getElementById('sendButton').addEventListener('click', async () => {
    const senderEmail = document.getElementById('senderEmail').value;
    const appPassword = document.getElementById('appPassword').value;
    const emailList = document.getElementById('emailList').value;
    const emailSubject = document.getElementById('emailSubject').value;
    const emailMessage = document.getElementById('emailMessage').value;
    const attachments = document.getElementById('attachments').files;

    const formData = new FormData();
    formData.append('senderEmail', senderEmail);
    formData.append('appPassword', appPassword);
    formData.append('recipients', emailList);
    formData.append('subject', emailSubject);
    formData.append('message', emailMessage);

    for (let i = 0; i < attachments.length; i++) {
        formData.append('attachments', attachments[i]);
    }

    // Show overlay and spinner
    overlay.style.display = 'flex'; // Change to flex for centering
    spinner.style.display = 'block';
    sendingText.innerText = 'Sending...'; // Reset text

    try {
        const response = await fetch('http://localhost:3000/send-emails', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        sendingText.innerText = result.message; // Update with success message

    } catch (error) {
        sendingText.innerText = 'Error: ' + error.message; // Update with error message
    } finally {
        // Hide overlay and spinner after receiving response
        setTimeout(() => {
            overlay.style.display = 'none';
            spinner.style.display = 'none';
        }, 4000); // Delay to allow the user to see the final message
    }
});

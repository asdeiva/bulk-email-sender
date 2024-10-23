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
    const overlay = document.getElementById('overlay');
    const spinner = document.getElementById('spinner');
    overlay.style.display = 'flex'; // Change to flex for centering
    spinner.style.display = 'block';

    try {
        const response = await fetch('http://localhost:3000/send-emails', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        document.getElementById('statusMessage').innerText = result.message;

    } catch (error) {
        document.getElementById('statusMessage').innerText = 'Error: ' + error.message;
    } finally {
        // Hide overlay and spinner after receiving response
        overlay.style.display = 'none';
        spinner.style.display = 'none';
    }
});

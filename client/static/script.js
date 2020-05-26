async function showSetup() {

    /** get API key */
    let res = await fetch(`/api/v1/app`, { method: 'POST' });
    let json = await res.json();
    $('#apiKey').html(json.token);

    $('.showInstruction').css('display', 'block')
}
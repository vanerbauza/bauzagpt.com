<script src="https://accounts.google.com/gsi/client" async defer></script>
<script>
  google.accounts.id.initialize({
    client_id: "766060384370-hb0q4c1j673vh230fjn6turs12urbfu3.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });
  google.accounts.id.renderButton(
    document.getElementById("btn-login"),
    { theme: "outline", size: "large" }
  );
</script>

export async function getToken() {
  const user = firebase.auth().currentUser;
  if (!user) throw new Error('not_authenticated');
  return await user.getIdToken();
}

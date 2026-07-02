namespace EventEase.Services
{
    public class UserService
    {
        public bool IsLoggedIn { get; private set; }
        public string Username { get; private set; } = string.Empty;

        public void Login(string username)
        {
            IsLoggedIn = true;
            Username = username;
        }

        public void Logout()
        {
            IsLoggedIn = false;
            Username = string.Empty;
        }
    }
}

interface CognitoUserInfo {
  cognitoId: string;
  email: string;
  emailVerified: boolean;
  username: string;
  nickname?: string;
  groups: string[];
  isAdmin: boolean;
}
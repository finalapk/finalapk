// // app/index.tsx
// import { Redirect } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator } from 'react-native';
// import * as authDB from '../utils/authDB';

// export default function Index() {
//   const [loading, setLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const checkLogin = async () => {
//       try {
//         const loggedIn = await authDB.getLoginStatus();
//         setIsLoggedIn(loggedIn);
//       } catch (error) {
//         console.error('Login check error:', error);
//         setIsLoggedIn(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkLogin();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#00B0FF" />
//       </View>
//     );
//   }

//   return <Redirect href={isLoggedIn ? '/screens/dashboard' : '/SignIn'} />;
// }


// // app/index.tsx
// import { Redirect } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { View, ActivityIndicator } from 'react-native';
// import { isUserLoggedIn, setupAuthStatusDB } from '../utils/authStatusDB';

// export default function Index() {
//   const [loading, setLoading] = useState(true);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);

//   useEffect(() => {
//     const init = async () => {
//       try {
//         await setupAuthStatusDB(); // ✅ Ensure table exists
//         const loggedIn = await isUserLoggedIn();
//         setIsLoggedIn(loggedIn);
//       } catch (error) {
//         console.error('Login check error:', error);
//         setIsLoggedIn(false);
//       } finally {
//         setLoading(false);
//       }
//     };

//     init();
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#00B0FF" />
//       </View>
//     );
//   }

//   return <Redirect href={isLoggedIn ? '/screens/dashboard' : '/SignIn'} />;
// }



// app/index.tsx
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { isUserLoggedIn, setupAuthStatusDB } from '../utils/authStatusDB';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ Ensure the auth_status table exists
        await setupAuthStatusDB();

        // ✅ Check if user is logged in
        const loggedIn = await isUserLoggedIn();
        setIsLoggedIn(loggedIn);
      } catch (error) {
        console.error('❌ Login check error:', error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ⏳ Show loading spinner until login status is confirmed
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00B0FF" />
      </View>
    );
  }

  // ✅ Redirect based on login status
  return <Redirect href={isLoggedIn ? '/screens/dashboard' : '/SignIn'} />;
}

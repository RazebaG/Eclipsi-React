import { useFocusEffect, useIsFocused, useRouter } from 'expo-router';
import { type ComponentType, useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ApiError, clearAuthSession, getAuthToken, getSessionVersion, isLocalLogout, subscribeAuthSession } from '../lib/api';
import { getVerifiedRole, profileRoutes, type ProfileRole } from '../lib/auth';
import { palette } from '../lib/palette';

const pending = -1;

function useProtectedRoute(allowedRoles?: readonly ProfileRole[]) {
  const router = useRouter();
  const focused = useIsFocused();
  const version = useSyncExternalStore(subscribeAuthSession, getSessionVersion, () => 0);
  const focusedVersion = useRef(version);
  const [approvedVersion, setApprovedVersion] = useState(pending);

  useFocusEffect(useCallback(() => {
    focusedVersion.current = getSessionVersion();
  }, []));

  useFocusEffect(useCallback(() => {
    let active = true;
    const isCurrent = () => active && getSessionVersion() === version;
    setApprovedVersion(pending);

    async function validate() {
      if (!(await getAuthToken())) {
        if (!isCurrent()) return;
        if (allowedRoles) {
          // The panel that just signed out already requested navigation to the home screen.
          if (focusedVersion.current === version || !isLocalLogout(version)) {
            router.replace('/auth/login');
          }
        } else {
          setApprovedVersion(version);
        }
        return;
      }

      const role = await getVerifiedRole();
      if (!isCurrent()) return;
      if (allowedRoles?.includes(role)) setApprovedVersion(version);
      else router.replace(profileRoutes[role]);
    }

    void validate().catch((error: unknown) => {
      if (!isCurrent()) return;
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        void clearAuthSession().catch(() => undefined);
        return;
      }
      // Keep private screens closed during network errors without discarding the token.
      if (allowedRoles) router.replace('/auth/login');
      else setApprovedVersion(version);
    });

    return () => {
      active = false;
      setApprovedVersion(pending);
    };
  }, [allowedRoles, router, version]));

  return focused && approvedVersion === version;
}

export function withRouteGuard(Screen: ComponentType, ...allowedRoles: ProfileRole[]) {
  const roles = allowedRoles.length ? allowedRoles : undefined;
  return function GuardedScreen() {
    const allowed = useProtectedRoute(roles);
    if (allowed) return <Screen />;
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={palette.indigo} accessibilityLabel="Validando sessão" />
      </View>
    );
  };
}

export function useLogout() {
  const router = useRouter();
  return () => {
    void clearAuthSession({ logout: true }).catch(() => undefined);
    router.replace('/');
  };
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.cream,
  },
});

export const USER_ROLES = {
    VISITOR: 'visitor',
    STUDENT: 'student',
    BDE_MEMBRE: 'bde_membre',
    FORMATEUR: 'formateur',
    ADMIN: 'admin',
};

export function isAdmin(user) {
    return user?.role === USER_ROLES.ADMIN;
}

export function isFormateur(user) {
    return user?.role === USER_ROLES.FORMATEUR;
}

export function isBdeMembre(user) {
    return user?.role === USER_ROLES.BDE_MEMBRE;
}

export function isStudent(user) {
    return user?.role === USER_ROLES.STUDENT;
}

export function getRoleLabel(user) {
    if (!user?.role) {
        return 'Authenticated user';
    }

    switch (user.role) {
        case USER_ROLES.BDE_MEMBRE:
            return 'BDE member';
        case USER_ROLES.FORMATEUR:
            return 'Formateur';
        case USER_ROLES.ADMIN:
            return 'Admin';
        case USER_ROLES.STUDENT:
            return 'Student';
        case USER_ROLES.VISITOR:
            return 'Visitor';
        default:
            return user.role;
    }
}

export function canManageTags(user) {
    return isAdmin(user) || isFormateur(user);
}

export function canManageBadges(user) {
    return isAdmin(user);
}

export function canManageUsers(user) {
    return isAdmin(user);
}

export function canManageCommunity(user) {
    return isAdmin(user) || isFormateur(user) || isBdeMembre(user);
}

export function canModerateBlogs(user) {
    return isAdmin(user) || isFormateur(user);
}

import { User, VisitLog, MOCK_USERS, MOCK_VISITS } from './mock-data';

// Using a simple singleton pattern for the mock "database"
class AppStore {
  private users: User[] = [...MOCK_USERS];
  private visits: VisitLog[] = [...MOCK_VISITS];
  private currentUser: User | null = null;

  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  getUsers() {
    return this.users;
  }

  blockUser(userId: string) {
    this.users = this.users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
  }

  getVisits() {
    return this.visits;
  }

  addVisit(visit: Omit<VisitLog, 'id'>) {
    const newVisit = {
      ...visit,
      id: Math.random().toString(36).substr(2, 9),
    };
    this.visits = [newVisit, ...this.visits];
    return newVisit;
  }

  updateVisitStatus(visitId: string, status: VisitLog['status']) {
    this.visits = this.visits.map(v => v.id === visitId ? { ...v, status } : v);
  }
}

export const store = new AppStore();
import { db } from '@/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  memberIds: string[];
  createdAt: Date;
}

export interface CreateGroupData {
  name: string;
  createdBy: string;
  memberIds: string[];
}

class GroupService {
  private groupsCollection = collection(db, 'groups');

  // Create a new group
  async createGroup(groupData: CreateGroupData): Promise<Group> {
    try {
      const docRef = await addDoc(this.groupsCollection, {
        ...groupData,
        createdAt: serverTimestamp()
      });
      
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Failed to create group');
      }
      
      return this.mapDocumentToGroup(docSnap);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Update a group
  async updateGroup(groupId: string, updates: Partial<CreateGroupData>): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  }

  // Delete a group
  async deleteGroup(groupId: string): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      await deleteDoc(groupRef);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  }

  // Get a single group
  async getGroup(groupId: string): Promise<Group | null> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const docSnap = await getDoc(groupRef);
      
      if (docSnap.exists()) {
        return this.mapDocumentToGroup(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting group:', error);
      throw error;
    }
  }

  // Get all groups for a user
  async getUserGroups(userId: string): Promise<Group[]> {
    try {
      const q = query(
        this.groupsCollection,
        where('memberIds', 'array-contains', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.mapDocumentToGroup(doc));
    } catch (error) {
      console.error('Error getting user groups:', error);
      throw error;
    }
  }

  // Real-time listener for user groups
  onUserGroupsChange(userId: string, callback: (groups: Group[]) => void) {
    const q = query(
      this.groupsCollection,
      where('memberIds', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const groups = querySnapshot.docs.map(doc => this.mapDocumentToGroup(doc));
      callback(groups);
    }, (error) => {
      console.error('Error listening to groups:', error);
    });
  }

  // Add member to group
  async addMemberToGroup(groupId: string, memberId: string): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }
      
      const groupData = groupSnap.data();
      const currentMembers = groupData.memberIds || [];
      
      if (!currentMembers.includes(memberId)) {
        await updateDoc(groupRef, {
          memberIds: [...currentMembers, memberId],
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  }

  // Remove member from group
  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    try {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      
      if (!groupSnap.exists()) {
        throw new Error('Group not found');
      }
      
      const groupData = groupSnap.data();
      const currentMembers = groupData.memberIds || [];
      
      await updateDoc(groupRef, {
        memberIds: currentMembers.filter((id: string) => id !== memberId),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  }

  // Helper method to map Firestore document to Group
  private mapDocumentToGroup(doc: any): Group {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      createdBy: data.createdBy,
      memberIds: data.memberIds || [],
      createdAt: data.createdAt?.toDate() || new Date()
    };
  }
}

export const groupService = new GroupService();

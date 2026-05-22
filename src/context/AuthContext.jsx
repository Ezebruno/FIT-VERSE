import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);

  // Init User from session storage just to persist login across refresh (optional, or use Token)
  // For simplicity, we trust LocalUser clone, but real updates come from API
  useEffect(() => {
    const storedUser = localStorage.getItem("fitverse_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      fetchUsers(); // If Admin, fetch info immediately
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  // Poll for updates if Logged In (Simple Real-time simulation)
  useEffect(() => {
    if (user) {
      fetchUsers();
      // If member, ensure we have latest version of OUR profile
      if (user.role === "member") {
        fetchUsers().then(() => {
          // Logic to find "me" in the fresh list is inside the next effect usually,
          // but simplest here is just relying on the list sync logic below
        });
      }
    }
  }, [user?.email]); // Re-fetch on login

  // Sync Current User Object from the FRESH usersList
  useEffect(() => {
    if (user && user.role === "member" && usersList.length > 0) {
      const freshUser = usersList.find((u) => u.id === user.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(user)) {
        setUser(freshUser);
        localStorage.setItem("fitverse_user", JSON.stringify(freshUser));
      }
    }
  }, [usersList]); // whenever list updates (e.g. after Admin action or polling)

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem("fitverse_user", JSON.stringify(data.user));
        if (data.user.role === "admin") fetchUsers();
        return { success: true, role: data.user.role };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return {
        success: false,
        message:
          'Error: No se pudo conectar con el Servidor. Asegúrate de ejecutar "node server/index.js"',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fitverse_user");
  };

  const registerUser = async (newUser) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUsers();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Error: Sin conexión al Servidor" };
    }
  };

  const deleteUser = async (id) => {
    await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  // Generic Update (used for Plan, Payment, Routine, etc)
  const _updateUserOnServer = async (id, fields) => {
    await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    fetchUsers();
  };

  const updateUserPlan = (planId) => {
    if (!user) return;
    _updateUserOnServer(user.id, {
      plan: planId === "pro" ? "Personalizado (Pro)" : "Común",
    });
  };

  const updateUserField = (userId, field, value) => {
    _updateUserOnServer(userId, { [field]: value });
  };

  const sendNotification = (userId, message) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (targetUser) {
      const newNotif = {
        id: Date.now(),
        message,
        date: new Date().toLocaleDateString(),
        read: false,
      };
      const updatedNotifs = [newNotif, ...(targetUser.notifications || [])];
      _updateUserOnServer(userId, { notifications: updatedNotifs });
    }
  };

  const markAttendance = (userId) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (targetUser) {
      _updateUserOnServer(userId, {
        attendance: (targetUser.attendance || 0) + 1,
      });
    }
  };

  const registerPayment = (userId, amount, planName) => {
    const targetUser = usersList.find((u) => u.id === userId);
    if (targetUser) {
      const newPayment = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        amount,
        plan: planName,
      };
      const updatedPayments = [newPayment, ...(targetUser.payments || [])];
      _updateUserOnServer(userId, {
        payments: updatedPayments,
        paymentStatus: "Paid", // Auto set to Paid
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        login,
        logout,
        registerUser,
        deleteUser,
        updateUserPlan,
        updateUserField,
        sendNotification,
        markAttendance,
        registerPayment,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

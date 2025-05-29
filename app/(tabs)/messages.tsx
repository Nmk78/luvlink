import ActionButton from "@/components/ActionButton";
import GradientBackground from "@/components/Gradient";
import auth from "@react-native-firebase/auth";
import firestore, {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "@react-native-firebase/firestore";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import { GiftedChat, IMessage } from "react-native-gifted-chat";

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const [coupleId, setCoupleId] = useState<string | null>(null);
  const currentUser = auth().currentUser;
  const db = getFirestore();

  useEffect(() => {
    const fetchCoupleId = async () => {
      if (!currentUser?.uid) return;

      const couplesRef = collection(db, "couples");

      const qA = query(couplesRef, where("userAid", "==", currentUser.uid));
      const snapshotA = await getDocs(qA);

      if (!snapshotA.empty) {
        setCoupleId(snapshotA.docs[0].id);
        return;
      }

      const qB = query(couplesRef, where("userBid", "==", currentUser.uid));
      const snapshotB = await getDocs(qB);

      if (!snapshotB.empty) {
        setCoupleId(snapshotB.docs[0].id);
        return;
      }

      setCoupleId(null);
    };

    fetchCoupleId();
  }, [currentUser?.uid]);

  useEffect(() => {
    const checkAccess = async () => {
      if (!coupleId || !currentUser?.uid) {
        setIsAuthorized(false);
        return;
      }

      const db = getFirestore();
      const coupleRef = doc(db, "couples", coupleId);
      const coupleSnap = await getDoc(coupleRef);

      if (!coupleSnap.exists()) {
        setIsAuthorized(false);
        return;
      }

      const coupleData = coupleSnap.data();
      if (!coupleData) {
        setIsAuthorized(false);
        return;
      }

      const { userAid, userBid } = coupleData;

      if (currentUser.uid !== userAid && currentUser.uid !== userBid) {
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);

      const messagesQuery = query(
        collection(coupleRef, "messages"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
        const fetchedMessages: IMessage[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt?.toDate() || new Date(),
            user: data.user,
          };
        });

        setMessages(fetchedMessages);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    checkAccess();
  }, [coupleId, currentUser?.uid]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      if (!coupleId || !currentUser) return;

      const db = getFirestore();
      const coupleRef = doc(db, "couples", coupleId);
      const messagesRef = collection(coupleRef, "messages");

      const msg = newMessages[0];
      await addDoc(messagesRef, {
        text: msg.text,
        createdAt: serverTimestamp(),
        user: {
          _id: currentUser.uid,
          name: currentUser.displayName || "You",
          avatar: currentUser.photoURL || "https://i.pravatar.cc/150?u=user",
        },
      });
    },
    [coupleId, currentUser]
  );

  if (!coupleId) {
    return (
      <View className="flex-1 justify-center items-center">
        <GradientBackground />
        {/* <Text className="text-xl text-pink-500">You need to link to your partnar to send message!</Text> */}
        <ActionButton
          onPress={() => router.push("/connect")}
          loading={loading}
          text="Connect with your partner to send message. 💞"
        />
      </View>
    );
  }
  const messagesRef = firestore()
    .collection("couples")
    .doc(coupleId)
    .collection("message");

  if (loading) return <Text>Loading chat...</Text>;
  if (!isAuthorized)
    return <Text>You are not allowed to access this chat.</Text>;

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{
        _id: currentUser?.uid || "",
        name: currentUser?.displayName || "You",
        avatar: currentUser?.photoURL || "https://i.pravatar.cc/150?u=user",
      }}
      showUserAvatar
      renderUsernameOnMessage
    />
  );
}

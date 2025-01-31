import 'package:cloud_firestore/cloud_firestore.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Function to save sentiment data
  Future<void> saveSentiment(String text, String sentiment) async {
    await _db.collection('sentiments').add({
      'text': text,
      'sentiment': sentiment,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  // Function to retrieve sentiment data
  Stream<QuerySnapshot> getSentiments() {
    return _db.collection('sentiments').orderBy('timestamp', descending: true).snapshots();
  }
}

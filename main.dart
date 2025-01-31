import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lottie/lottie.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:fl_chart/fl_chart.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(),
      home: CompanyNameScreen(),
    );
  }
}

class CompanyNameScreen extends StatefulWidget {
  @override
  _CompanyNameScreenState createState() => _CompanyNameScreenState();
}

class _CompanyNameScreenState extends State<CompanyNameScreen> {
  final TextEditingController _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Lottie.asset('assets/company.json', height: 150),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: TextField(
                controller: _controller,
                decoration: InputDecoration(labelText: 'Enter Your Company Name'),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                if (_controller.text.isNotEmpty) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => HomeScreen(companyName: _controller.text),
                    ),
                  );
                }
              },
              child: Text("Continue"),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeScreen extends StatefulWidget {
  final String companyName;
  HomeScreen({required this.companyName});

  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final TextEditingController _textController = TextEditingController();

  Future<void> saveSentiment(String text) async {
    // Simulated Sentiment Analysis (Replace with a working API)
    String sentiment = "neutral";
    if (text.contains("good")) {
      sentiment = "positive";
    } else if (text.contains("bad")) {
      sentiment = "negative";
    }

    await _db.collection('sentiments').add({
      'text': text,
      'sentiment': sentiment,
      'company': widget.companyName,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }

  Stream<QuerySnapshot> getSentiments() {
    return _db.collection('sentiments')
        .where('company', isEqualTo: widget.companyName)
        .orderBy('timestamp', descending: true)
        .snapshots();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("${widget.companyName} Sentiments")),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(10.0),
            child: TextField(
              controller: _textController,
              decoration: InputDecoration(labelText: "Enter text for analysis"),
            ),
          ),
          ElevatedButton(
            onPressed: () {
              if (_textController.text.isNotEmpty) {
                saveSentiment(_textController.text);
                _textController.clear();
              }
            },
            child: Text("Analyze Sentiment"),
          ),
          Expanded(
            child: StreamBuilder(
              stream: getSentiments(),
              builder: (context, AsyncSnapshot<QuerySnapshot> snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Center(child: CircularProgressIndicator());
                }
                if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
                  return Center(child: Text("No sentiments found"));
                }

                // Count Sentiment Types
                int positive = 0, negative = 0, neutral = 0;
                for (var doc in snapshot.data!.docs) {
                  var data = doc.data() as Map<String, dynamic>;
                  if (data['sentiment'] == "positive") positive++;
                  else if (data['sentiment'] == "negative") negative++;
                  else neutral++;
                }

                return Column(
                  children: [
                    Expanded(
                      child: ListView(
                        children: snapshot.data!.docs.map((doc) {
                          var data = doc.data() as Map<String, dynamic>;
                          return Dismissible(
                            key: Key(doc.id),
                            onDismissed: (direction) {
                              _db.collection('sentiments').doc(doc.id).delete();
                            },
                            child: ListTile(
                              title: Text(data['text']),
                              subtitle: Text("Sentiment: ${data['sentiment']}"),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    SizedBox(height: 20),
                    PieChart(
                      PieChartData(
                        sections: [
                          PieChartSectionData(color: Colors.green, value: positive.toDouble(), title: "Positive"),
                          PieChartSectionData(color: Colors.red, value: negative.toDouble(), title: "Negative"),
                          PieChartSectionData(color: Colors.blue, value: neutral.toDouble(), title: "Neutral"),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

package com.instantdelivery

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            InstantDeliveryApp()
        }
    }
}

@Composable
fun InstantDeliveryApp() {
    val categories = listOf(
        "🍔" to "Food",
        "🛒" to "Groceries",
        "💊" to "Medicines",
        "🩺" to "Healthcare & Wellness Products"
    )
    var search by remember { mutableStateOf(TextFieldValue("")) }
    val configuration = LocalConfiguration.current
    val isTablet = configuration.screenWidthDp >= 600

    Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = if (isTablet) 40.dp else 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "Instant Delivery",
                fontSize = if (isTablet) 36.sp else 28.sp,
                color = Color(0xFF222222),
                modifier = Modifier.padding(bottom = 4.dp)
            )
            Text(
                text = "Get anything delivered within minutes",
                fontSize = if (isTablet) 20.sp else 14.sp,
                color = Color(0xFF666666)
            )
            Spacer(modifier = Modifier.height(if (isTablet) 40.dp else 20.dp))
            Row(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                categories.forEach { (icon, label) ->
                    Column(
                        modifier = Modifier
                            .width(if (isTablet) 120.dp else 80.dp)
                            .height(if (isTablet) 150.dp else 100.dp)
                            .background(Color(0xFFF2F2F2), RoundedCornerShape(16.dp)),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text(text = icon, fontSize = if (isTablet) 48.sp else 32.sp)
                        Text(text = label, fontSize = if (isTablet) 22.sp else 16.sp, color = Color(0xFF333333))
                    }
                }
            }
        }
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = if (isTablet) 30.dp else 20.dp, start = 24.dp, end = 24.dp)
        ) {
            BasicTextField(
                value = search,
                onValueChange = { search = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(30.dp))
                    .padding(vertical = if (isTablet) 16.dp else 12.dp, horizontal = 20.dp),
                decorationBox = { innerTextField ->
                    if (search.text.isEmpty()) {
                        Text("Search for food, groceries, medicines...", color = Color(0xFF888888), fontSize = if (isTablet) 20.sp else 16.sp)
                    }
                    innerTextField()
                }
            )
        }
    }
}

<%--
~ Copyright (c) 2022, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
~
~  WSO2 LLC. licenses this file to you under the Apache License,
~  Version 2.0 (the "License"); you may not use this file except
~  in compliance with the License.
~  You may obtain a copy of the License at
~
~    http://www.apache.org/licenses/LICENSE-2.0
~
~ Unless required by applicable law or agreed to in writing,
~ software distributed under the License is distributed on an
~ "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
~ KIND, either express or implied.  See the License for the
~ specific language governing permissions and limitations
~ under the License.
--%>

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="org.owasp.encoder.Encode" %>
<%@ page import="java.io.File" %>

<jsp:directive.include file="includes/localize.jsp"/>

<!-- Include tenant context -->
<jsp:directive.include file="tenant-resolve.jsp"/>

<%
    String username = request.getParameter("username");
    System.out.println("my final username: " + username);
%>

<!doctype html>
<html>
<head>
    <!-- header -->
    <%
        File headerFile = new File(getServletContext().getRealPath("extensions/header.jsp"));
        if (headerFile.exists()) {
    %>
        <jsp:include page="extensions/header.jsp"/>
    <% } else { %>
        <jsp:include page="includes/header.jsp"/>
    <% } %>

</head>
<body class="login-portal layout recovery-layout">

    <script>
        // Mask Email
        function maskEmail(email) {
            email = email.split('');
            let finalArr=[];
            let len = email.indexOf('@');
            email.forEach((item,pos)=> {
                (pos>=1 && pos<=len-2) ? finalArr.push('*') : finalArr.push(email[pos]);
            })
            document.getElementById("maskedEmail").innerHTML = finalArr.join('');
        }
    </script>
    <main class="center-segment">
        <div>
            <!-- product-title -->
            <%
                File productTitleFile = new File(getServletContext().getRealPath("extensions/product-title.jsp"));
                if (productTitleFile.exists()) {
            %>
                <jsp:include page="extensions/product-title.jsp"/>
            <% } else { %>
                <jsp:include page="includes/product-title.jsp"/>
            <% } %>
            <div class="ui segment">
                <h2 class="ui header portal-logo-tagline" data-testid="self-register-complete-page-header">
                    You're almost there!
                </h2>
                 <p class="portal-tagline-description">
                    Check your inbox at
                    <b><span id="maskedEmail"></span></b> for instructions to activate your account.
                    <script>maskEmail('<%= username %>');</script>
                    </br></br>
                </p>
            </div>
        </div>
    </main>

    <!-- footer -->
    <%
        File footerFile = new File(getServletContext().getRealPath("extensions/footer.jsp"));
        if (footerFile.exists()) {
    %>
        <jsp:include page="extensions/footer.jsp"/>
    <% } else { %>
        <jsp:include page="includes/footer.jsp"/>
    <% } %>

</body>
</html>
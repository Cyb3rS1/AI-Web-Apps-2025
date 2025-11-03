<template>
    <div class="container-fluid bg-success p-3">
        <div>
            <p class="text-light text-center">Hello, I'm the footer!</p>
        </div>
        <div class="row">
            <div class="col d-flex flex-row gap-3">
                <img src="#" class="border border-2 bg-light" alt="I'm an image!"></img>
                <section class="d-flex flex-column">
                    <h5>Join the mailing list!</h5>
                    <input type="email" class="rounded"></input>
                </section>
            </div>
            <div class="col d-flex flex-column gap-3">
                <p class="text-light">Quick Links</p>
                <ul>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Item 1</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Item 1</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#">Item 1</a>
                    </li>


                </ul>

            </div>
                

           

        </div>

    </div>
</template>

<script>
export default {
    name: "MyFooter"
}
</script>